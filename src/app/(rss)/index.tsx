import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import * as AC from "@bacons/apple-colors";
import { rssService, RSSItem, RSSFeed } from "../../services/rss-service";

const EXPO_CHANGELOG_RSS_URL = "https://expo.dev/changelog/rss.xml";

export default function RSSFeedRoute() {
  const [feed, setFeed] = useState<RSSFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const feedData = await rssService.fetchFeed(EXPO_CHANGELOG_RSS_URL);
      setFeed(feedData);
    } catch (err) {
      console.error("Failed to load RSS feed:", err);
      setError(err instanceof Error ? err.message : "Failed to load RSS feed");

      if (!isRefresh) {
        Alert.alert(
          "Error Loading Feed",
          "Failed to load the Expo changelog. Please check your internet connection and try again.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed(true);
  };

  useEffect(() => {
    loadFeed();
  }, []);

  if (loading && !refreshing) {
    return (
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
          Loading Expo Changelog...
        </Text>
      </View>
    );
  }

  if (error && !feed) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: AC.systemBackground }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
          minHeight: 400,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: "600",
            color: AC.systemRed,
            textAlign: "center",
            marginBottom: 8,
          }}>
            Failed to Load Feed
          </Text>
          <Text style={{
            color: AC.secondaryLabel,
            textAlign: "center",
            marginBottom: 24,
          }}>
            {error}
          </Text>
          <Pressable
            onPress={() => loadFeed()}
            style={{
              backgroundColor: AC.systemBlue,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Try Again
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: AC.systemBackground }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ padding: 16 }}>
        {feed && (
          <>
            <Text style={{
              fontSize: 28,
              fontWeight: "700",
              color: AC.label,
              marginBottom: 8,
            }}>
              Expo Changelog
            </Text>
            <Text style={{
              fontSize: 16,
              color: AC.secondaryLabel,
              marginBottom: 24,
              lineHeight: 24,
            }}>
              Stay up to date with the latest Expo features, improvements, and bug fixes.
            </Text>
          </>
        )}

        {feed?.items.map((item, index) => (
          <RSSItemCard key={item.guid || index} item={item} />
        ))}

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

function RSSItemCard({ item }: { item: RSSItem }) {
  return (
    <Link href={`/article/${encodeURIComponent(item.guid)}`} asChild>
      <Pressable style={{
        backgroundColor: AC.secondarySystemBackground,
        borderRadius: 12,
        borderCurve: "continuous",
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}>
        <View style={{ gap: 8 }}>
          <Text selectable style={{
            fontSize: 18,
            fontWeight: "600",
            color: AC.label,
            lineHeight: 26,
          }}>
            {item.title}
          </Text>

          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}>
            <Text style={{
              fontSize: 14,
              color: AC.systemBlue,
              fontWeight: "500",
            }}>
              {rssService.formatRelativeDate(item.pubDate)}
            </Text>
            {item.author && (
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
                  {item.author}
                </Text>
              </>
            )}
          </View>

          <Text selectable style={{
            fontSize: 15,
            color: AC.secondaryLabel,
            lineHeight: 22,
          }} numberOfLines={3}>
            {rssService.stripHtml(item.description)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
