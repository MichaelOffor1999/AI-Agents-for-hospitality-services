from fastapi import APIRouter, HTTPException, Request, Response
from models.transcript import Transcript
from models.order import Order
from models.restaurant import Restaurant
from utils.db import db
from utils.elevenlabs_client import ElevenLabsClient
import openai
import os
import logging
from datetime import datetime
from typing import Optional, Dict, Any
import json
from fastapi.responses import FileResponse
from twilio.twiml.voice_response import VoiceResponse, Play, Record

# Initialize ElevenLabs client
elevenlabs_client = ElevenLabsClient()

router = APIRouter()



@router.post("/webhook")
async def twilio_webhook(request: Request):
    """
    Handles Twilio webhook events for incoming calls.
    1. Greets the caller using ElevenLabs voice
    2. Records caller's speech
    3. Transcribes with Whisper
    4. Processes with GPT
    5. Responds with ElevenLabs audio
    """
    try:
        form = await request.form()
        call_status = form.get("CallStatus")
        recording_url = form.get("RecordingUrl")
        restaurant_phone = form.get("To")
        caller_id = form.get("From")

        # Initial call greeting
        if call_status == "ringing":
            greeting_text = "Hello! Welcome to our AI ordering system. How may I help you today?"
            audio_path = f"/tmp/greeting_{caller_id}.mp3"
            try:
                elevenlabs_client.synthesize(greeting_text, audio_path)
                response = VoiceResponse()
                response.play(audio_path)
                response.record(maxLength="30", action="/voice/webhook", timeout="3")
                xml_response = str(response)
            except Exception as e:
                logging.error(f"ElevenLabs synthesis failed for greeting: {e}")
                response = VoiceResponse()
                response.say("Hello! Welcome to our AI ordering system. How may I help you today?", voice="alice")
                response.record(maxLength="30", action="/voice/webhook", timeout="3")
                xml_response = str(response)
            finally:
                # Clean up temp file if it exists
                if os.path.exists(audio_path):
                    try:
                        os.remove(audio_path)
                    except Exception as cleanup_err:
                        logging.warning(f"Failed to delete temp greeting audio: {cleanup_err}")
            return Response(content=xml_response, media_type="application/xml")

        # Handle recorded audio
        if recording_url:
            # 1. Transcribe audio using Whisper API
            transcript_text = await transcribe_audio(recording_url)

            # 2. Process with GPT for intent detection
            intent_response = await process_with_gpt(transcript_text)

            # 3. Create transcript record
            restaurant = await db.restaurants.find_one({"phone": restaurant_phone})
            if not restaurant:
                error_text = "Sorry, this restaurant is not registered in our system."
                audio_path = f"/tmp/error_{caller_id}.mp3"
                try:
                    elevenlabs_client.synthesize(error_text, audio_path)
                    response = VoiceResponse()
                    response.play(audio_path)
                    response.hangup()
                    xml_response = str(response)
                except Exception as e:
                    logging.error(f"ElevenLabs synthesis failed for error message: {e}")
                    response = VoiceResponse()
                    response.say(error_text, voice="alice")
                    response.hangup()
                    xml_response = str(response)
                finally:
                    if os.path.exists(audio_path):
                        try:
                            os.remove(audio_path)
                        except Exception as cleanup_err:
                            logging.warning(f"Failed to delete temp error audio: {cleanup_err}")
                return Response(content=xml_response, media_type="application/xml")

            transcript = Transcript(
                restaurant_id=restaurant["_id"],
                user_id=caller_id,
                call_text=transcript_text,
                timestamp=datetime.utcnow().isoformat()
            )
            result = await db.transcripts.insert_one(transcript.dict(by_alias=True))
            transcript.id = str(result.inserted_id)

            # 4. Handle the intent (order, booking, or question)
            reply = await handle_intent(intent_response, restaurant["_id"], caller_id, transcript.id)
            reply_text = reply.get("message", "Thank you. Your request has been processed.")
            audio_path = f"/tmp/reply_{caller_id}.mp3"
            try:
                elevenlabs_client.synthesize(reply_text, audio_path)
                response = VoiceResponse()
                response.play(audio_path)
                response.hangup()
                xml_response = str(response)
            except Exception as e:
                logging.error(f"ElevenLabs synthesis failed for reply: {e}")
                response = VoiceResponse()
                response.say(reply_text, voice="alice")
                response.hangup()
                xml_response = str(response)
            finally:
                if os.path.exists(audio_path):
                    try:
                        os.remove(audio_path)
                    except Exception as cleanup_err:
                        logging.warning(f"Failed to delete temp reply audio: {cleanup_err}")
            return Response(content=xml_response, media_type="application/xml")

        # Fallback for missing audio
        response = VoiceResponse()
        response.say("I'm sorry, I couldn't hear that. Could you please repeat?", voice="alice")
        response.record(maxLength="30", action="/voice/webhook", timeout="3")
        return Response(content=str(response), media_type="application/xml")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def transcribe_audio(audio_url: str) -> str:
    """
    Transcribes audio using OpenAI's Whisper API
    """
    try:
        # Download audio file from URL
        # Convert to format accepted by Whisper
        # Send to Whisper API
        response = await openai.Audio.transcribe("whisper-1", audio_url)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

async def process_with_gpt(transcript: str) -> dict:
    """
    Processes transcript with GPT to detect intent and extract structured data
    """
    try:
        # Construct prompt for GPT
        prompt = f"""
        Analyze this customer conversation and extract the following:
        1. Intent (order, booking, or question)
        2. Relevant details based on intent:
           - For orders: items, quantities, special instructions
           - For bookings: date, time, party size
           - For questions: specific topic, context needed
        
        Conversation: {transcript}
        
        Return as JSON format.
        """

        response = await openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a restaurant AI assistant analyzing customer conversations."},
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message.content

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GPT processing error: {str(e)}")

async def handle_intent(intent_data: dict, restaurant_id: str, user_id: str, transcript_id: str) -> dict:
    """
    Handles the detected intent and takes appropriate action
    """
    try:
        if intent_data["intent"] == "order":
            # Create new order
            order_response = await create_order_from_intent(intent_data, restaurant_id, user_id)
            # Link order to transcript
            await db.transcripts.update_one(
                {"_id": transcript_id},
                {"$set": {"order_id": order_response["id"]}}
            )
            return order_response

        elif intent_data["intent"] == "booking":
            # Handle booking logic
            return {"message": "Booking created", "details": intent_data}

        else:  # question
            # Handle FAQ/question logic
            return {"message": "Question processed", "details": intent_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intent handling error: {str(e)}")

async def create_order_from_intent(intent_data: dict, restaurant_id: str, user_id: str) -> dict:
    """
    Creates an order in the database from the intent data
    """
    try:
        # Get restaurant menu for validation
        restaurant = await db.restaurants.find_one({"_id": restaurant_id})
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        # Extract order items and validate against menu
        menu_items = {item["item"].lower(): item for item in restaurant["menu"]}
        order_items = []
        total = 0.0



        skipped_items = 0
        for item in intent_data.get("items", []):
            # Validate item structure
            if not isinstance(item, dict) or "item" not in item or not isinstance(item["item"], str):
                skipped_items += 1
                continue
            menu_item = menu_items.get(item["item"].lower())
            if not menu_item:
                skipped_items += 1
                continue

            quantity = item.get("quantity", 1)
            price = menu_item["price"] * quantity
            order_items.append({
                "item": menu_item["item"],
                "qty": quantity,
                "price": menu_item["price"],
                "total": price
            })
            total += price

        if skipped_items > 0 or not order_items:
            # Ask user to repeat or clarify
            return {
                "message": "I didn’t catch some of your order details. Could you please repeat or clarify the items you want?"
            }

        # Create new order
        order = Order(
            restaurant_id=restaurant_id,
            items=order_items,
            customer_phone=user_id,
            timestamp=datetime.utcnow().isoformat(),
            notes=intent_data.get("special_instructions", ""),
            total_amount=total
        )

        result = await db.orders.insert_one(order.dict(by_alias=True))
        order.id = str(result.inserted_id)

        # Generate receipt (you can implement this later)
        # receipt_path = await generate_receipt(order)
        # await db.orders.update_one(
        #     {"_id": order.id},
        #     {"$set": {"receipt_path": receipt_path}}
        # )

        return {
            "id": order.id,
            "status": "created",
            "total": total,
            "items": order_items
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")



async def handle_booking_intent(intent_data: dict, restaurant_id: str) -> dict:
    """
    Handles booking requests
    """
    # Implement booking logic here
    booking = {
        "restaurant_id": restaurant_id,
        "date": intent_data.get("date"),
        "time": intent_data.get("time"),
        "party_size": intent_data.get("party_size"),
        "status": "confirmed"
    }
    
    result = await db.bookings.insert_one(booking)
    booking["id"] = str(result.inserted_id)
    
    return booking

async def handle_question_intent(intent_data: dict, restaurant_id: str) -> dict:
    """
    Handles general questions about the restaurant
    """
    restaurant = await db.restaurants.find_one({"_id": restaurant_id})
    
    # Use GPT to generate response based on restaurant info
    prompt = f"""
    Answer the following question about this restaurant:
    Restaurant Info:
    Name: {restaurant["name"]}
    Hours: {restaurant["hours"]}
    Menu: {restaurant["menu"]}
    
    Question: {intent_data["question"]}
    """
    
    response = await openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful restaurant assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return {
        "answer": response.choices[0].message.content,
        "context": {
            "restaurant": restaurant["name"],
            "topic": intent_data.get("topic")
        }
    }