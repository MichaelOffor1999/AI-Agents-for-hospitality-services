# Toggle Debugging Test Plan

## Steps to Test Toggle Functionality

### 1. **Open the App**
- Navigate to Menu Management screen
- Check browser console for debug logs

### 2. **Initial State Check**
- Look for logs: "MenuData length:", "FilteredMenuData length:"
- Verify items are loading with correct availability states

### 3. **Toggle Test Sequence**
1. **Find an available item (green toggle)**
2. **Click the toggle to make it unavailable**
3. **Check console logs for:**
   - "Toggle pressed for item: X current state: true"
   - "=== TOGGLE START ==="
   - "Toggling from true to false"
   - "Updated item: {...available: false}"
   - "=== TOGGLE END ==="

4. **Verify visual changes:**
   - Toggle should move to left (OFF position)
   - Background should turn gray
   - Item should show "Currently Unavailable" overlay

5. **Click the same toggle again to make it available**
6. **Check console logs for:**
   - "Toggle pressed for item: X current state: false"
   - "Toggling from false to true"
   - "Updated item: {...available: true}"

7. **Verify visual changes:**
   - Toggle should move to right (ON position)
   - Background should turn green
   - "Currently Unavailable" overlay should disappear

### 4. **Common Issues to Check**
- If toggle doesn't move: Check translateX calculation
- If state doesn't update: Check setLocalMenuItems function
- If visual doesn't update: Check FlatList extraData and keyExtractor
- If console shows errors: Check item ID and state management

### 5. **Expected Console Output Pattern**
```
MenuData length: 8
FilteredMenuData length: 8
First item availability: true

Toggle pressed for item: 1 current state: true
=== TOGGLE START ===
Item ID: 1
Current localMenuItems: 8
Found item: {id: 1, name: "Truffle Risotto", available: true, ...}
Toggling from true to false
Previous items count: 8
Updated item: {id: 1, name: "Truffle Risotto", available: false, ...}
New items count: 8
=== TOGGLE END ===
Truffle Risotto is now unavailable
```

## Debugging Commands
If issues persist:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try toggling items and watch for error messages
4. Look for patterns in successful vs failed toggles
