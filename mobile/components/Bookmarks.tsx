import { View, Pressable } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { useAppDispatch, useAppSelector } from "../store/appState"
import { getCurrentlyPlayingBook } from "../store/selectors/bookshelfSelectors"
import { bookshelfSlice } from "../store/slices/bookshelfSlice"
import { UIText } from "./UIText"

export function Bookmarks() {
  const book = useAppSelector(getCurrentlyPlayingBook)
  const dispatch = useAppDispatch()

  if (!book) return null

  return (
    <ScrollView>
      {book.bookmarks.map((bookmark) => (
        <View key={JSON.stringify(bookmark)} style={{ paddingHorizontal: 8 }}>
          <Pressable
            onPress={async () => {
              dispatch(
                bookshelfSlice.actions.bookmarkTapped({
                  bookId: book.id,
                  bookmark: { locator: bookmark, timestamp: Date.now() },
                }),
              )
            }}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#CCC",
              paddingVertical: 16,
              paddingHorizontal: 16,
            }}
          >
            <UIText
              style={{
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {bookmark.title}
            </UIText>
            {bookmark.locations?.position && (
              <UIText
                style={{
                  fontSize: 13,
                  marginTop: 8,
                }}
              >
                Page {bookmark.locations?.position}
              </UIText>
            )}
          </Pressable>
        </View>
      ))}
    </ScrollView>
  )
}
