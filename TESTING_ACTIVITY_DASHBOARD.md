# Testing the Clickable Activity Dashboard

## Prerequisites
- Backend server running on http://localhost:5050
- Frontend server running (React development server or production build)
- At least one user account with some activity data

## Test Steps

### 1. Start the Backend
```bash
cd backend
python run.py
```
Backend should start on port 5050.

### 2. Start the Frontend
```bash
cd frontend
npm start
```
Frontend should start on port 3000.

### 3. Test Regular User Flow

#### Login
1. Navigate to the website
2. Login with a user account
3. Go to "My Profile" page

#### Test Activity Dashboard
1. **View Summary Cards**
   - You should see 5 colored cards:
     - Mood Entries (purple gradient) - Not clickable
     - Journal Entries (pink gradient) - Clickable ✓
     - Articles Read (blue gradient) - Clickable ✓
     - Articles Liked (pink-yellow gradient) - Clickable ✓
     - Comments (teal-pink gradient) - Clickable ✓

2. **Test Journals Card**
   - Click the "Journal Entries" card
   - A modal should appear showing all your journals
   - Each journal shows:
     - Title
     - Date
     - Emotion tag
     - Sentiment score
   - Hover over a journal → card should lift up slightly
   - Click a journal → should navigate to journal detail page
   - Click outside modal or × button → modal should close

3. **Test Articles Read Card**
   - Click the "Articles Read" card
   - Modal shows all articles you've read
   - Each article shows:
     - Article title
     - Date you read it
   - Click an article → should navigate to article detail page

4. **Test Articles Liked Card**
   - Click the "Articles Liked" card
   - Modal shows all articles you've liked
   - Each article shows:
     - Article title
     - Date you liked it
   - Click an article → should navigate to article detail page

5. **Test Comments Card**
   - Click the "Comments" card
   - Modal shows all your comments
   - Each comment shows:
     - Your comment text (in quotes)
     - Article title where you commented
     - Date of comment
   - Click a comment → should navigate to that article's detail page

### 4. Test Doctor Flow

#### Login as Doctor
1. Logout from user account
2. Login with a doctor account
3. Navigate to a patient's profile (from your patients list)

#### Test Patient Activity Dashboard
1. **View Patient's Activity**
   - You should see the same 5 colored cards but with patient's data
   - Cards should show patient's statistics, not yours

2. **Click Each Card**
   - Journal Entries → shows patient's journals
   - Articles Read → shows articles patient has read
   - Articles Liked → shows articles patient has liked
   - Comments → shows patient's comments
   
3. **Verify Navigation**
   - Clicking journals should navigate to patient's journal entries
   - Clicking articles should navigate to those articles
   - All links should work correctly

### 5. Test Edge Cases

#### Empty States
1. Login with a new user (no activity)
2. Go to My Profile
3. Click each card:
   - Journals → "No journal entries yet"
   - Articles Read → "No articles read yet"
   - Articles Liked → "No liked articles yet"
   - Comments → "No comments yet"

#### Deleted Articles
1. If an article has been deleted but you have a like/comment on it
2. The card should show "Article #[ID]" as fallback
3. Clicking should still navigate (might show 404 on article page)

## Expected Behaviors

### Visual Feedback
✓ Cursor changes to pointer when hovering clickable cards
✓ Cards lift up 5px on hover with enhanced shadow
✓ "👆 Click to view all" hint appears on clickable cards
✓ Modal has smooth fade-in animation
✓ Items in modal have hover effect

### Navigation
✓ Journals → `/journals/{id}`
✓ Articles → `/articles/{id}`
✓ All navigation is immediate (no loading delay)

### Modal Behavior
✓ Click card → modal opens
✓ Click × button → modal closes
✓ Click outside modal (dark overlay) → modal closes
✓ Click inside modal content → modal stays open
✓ Modal is scrollable if content is long
✓ Modal is responsive (works on mobile)

### Data Display
✓ All dates are formatted nicely
✓ Article titles are shown (not just IDs)
✓ Comment text is displayed in quotes
✓ Emotion tags have pill-style background
✓ Sentiment scores show 2 decimal places

## Troubleshooting

### Modal doesn't appear when clicking card
- Check browser console for errors
- Verify `showDetailView` state is being set
- Check if `article_comments_list` is in the API response

### "No data" message appears but you have data
- Check API response in Network tab
- Verify backend is returning the correct lists
- Check if data structure matches frontend expectations

### Navigation doesn't work
- Verify React Router is set up correctly
- Check if routes for `/journals/:id` and `/articles/:id` exist
- Look for navigation errors in console

### Article titles show as "Article #X"
- Check if article relationships are loaded in backend
- Verify `al.article` and `ac.article` are accessible
- Ensure articles aren't deleted from database

## API Response Verification

Open browser DevTools → Network tab → Click an activity card → Check the API response:

```json
{
  "summary": { ... },
  "journal_list": [ ... ],
  "articles_read_list": [
    {
      "id": 1,
      "article_id": 5,
      "article_title": "Understanding Anxiety",  // ← Must be present
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "articles_liked_list": [
    {
      "id": 1,
      "article_id": 5,
      "article_title": "Understanding Anxiety",  // ← Must be present
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "article_comments_list": [  // ← Must be present
    {
      "id": 1,
      "article_id": 5,
      "article_title": "Understanding Anxiety",  // ← Must be present
      "content": "Great article!",
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

## Success Criteria

✅ All clickable cards respond to clicks
✅ Modals open and close smoothly
✅ All data displays correctly with proper formatting
✅ Navigation works to journals and articles
✅ Works for both users and doctors
✅ Empty states show appropriate messages
✅ Hover effects work on all interactive elements
✅ No console errors
✅ No API errors (check Network tab)
