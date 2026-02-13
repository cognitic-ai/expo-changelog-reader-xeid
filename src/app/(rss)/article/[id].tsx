import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Stack } from "expo-router/stack";
import * as WebBrowser from "expo-web-browser";
import * as AC from "@bacons/apple-colors";
import { rssService, RSSItem, RSSFeed } from "../../../services/rss-service";

const EXPO_CHANGELOG_RSS_URL = "https://expo.dev/changelog/rss.xml";

export default function ArticleRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<RSSItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) {
        setError("No article ID provided");
        setLoading(false);
        return;
      }

      try {
        const decodedId = decodeURIComponent(id);
        const feedData = await rssService.fetchFeed(EXPO_CHANGELOG_RSS_URL);
        const foundArticle = feedData.items.find((item) => item.guid === decodedId);

        if (foundArticle) {
          setArticle(foundArticle);
        } else {
          setError("Article not found");
        }
      } catch (err) {
        console.error("Failed to load article:", err);
        setError(err instanceof Error ? err.message : "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  const openInBrowser = async () => {
    if (article?.link) {
      try {
        await WebBrowser.openBrowserAsync(article.link);
      } catch (error) {
        Alert.alert("Error", "Failed to open link in browser");
      }
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: AC.systemBackground,
        }}>
          <ActivityIndicator size="large" color={AC.systemBlue} />
          <Text style={{
            marginTop: 16,
            color: AC.secondaryLabel,
            fontSize: 16,
          }}>
            Loading article...
          </Text>
        </View>
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Stack.Screen options={{ title: "Error" }} />
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: AC.systemBackground,
          padding: 32,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: "600",
            color: AC.systemRed,
            textAlign: "center",
            marginBottom: 8,
          }}>
            {error || "Article not found"}
          </Text>
          <Text style={{
            color: AC.secondaryLabel,
            textAlign: "center",
            marginBottom: 24,
          }}>
            The article you're looking for could not be loaded.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: AC.systemBlue,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Article",
          headerRight: () => (
            <Pressable
              onPress={openInBrowser}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{
                color: AC.systemBlue,
                fontSize: 16,
                fontWeight: "600",
              }}>
                Open
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: AC.systemBackground }}
      >
        <View style={{ padding: 16 }}>
          <Text selectable style={{
            fontSize: 24,
            fontWeight: "700",
            color: AC.label,
            lineHeight: 32,
            marginBottom: 16,
          }}>
            {article.title}
          </Text>

          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
            padding: 12,
            backgroundColor: AC.secondarySystemBackground,
            borderRadius: 8,
            borderCurve: "continuous",
          }}>
            <Text style={{
              fontSize: 14,
              color: AC.systemBlue,
              fontWeight: "500",
            }}>
              {rssService.formatDate(article.pubDate)}
            </Text>
            {article.author && (
              <>
                <View style={{
                  width: 2,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: AC.tertiaryLabel,
                }} />
                <Text style={{
                  fontSize: 14,
                  color: AC.tertiaryLabel,
                }}>
                  {article.author}
                </Text>
              </>
            )}
          </View>

          <View style={{
            backgroundColor: AC.secondarySystemBackground,
            borderRadius: 12,
            borderCurve: "continuous",
            padding: 16,
            marginBottom: 24,
          }}>
            <Text selectable style={{
              fontSize: 16,
              color: AC.label,
              lineHeight: 24,
            }}>
              {rssService.stripHtml(article.description)}
            </Text>
          </View>

          {article.link && (
            <Pressable
              onPress={openInBrowser}
              style={{
                backgroundColor: AC.systemBlue,
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderRadius: 10,
                borderCurve: "continuous",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
              }}>
                Read Full Article
              </Text>
            </Pressable>
          )}

          {article.category && (
            <View style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 24,
            }}>
              {Array.isArray(article.category) ? (
                article.category.map((cat, index) => (
                  <CategoryTag key={index} category={cat} />
                ))
              ) : (
                <CategoryTag category={article.category} />
              )}
            </View>
          )}

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </>
  );
}

function CategoryTag({ category }: { category: string }) {
  return (
    <View style={{
      backgroundColor: AC.systemFill,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderCurve: "continuous",
    }}>
      <Text style={{
        fontSize: 12,
        color: AC.secondaryLabel,
        fontWeight: "500",
      }}>
        {category}
      </Text>
    </View>
  );
}