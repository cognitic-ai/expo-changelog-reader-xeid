import { XMLParser } from 'fast-xml-parser';

export interface RSSItem {
  guid: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  author?: string;
  category?: string | string[];
}

export interface RSSFeed {
  title: string;
  description: string;
  link: string;
  lastBuildDate: string;
  items: RSSItem[];
}

export class RSSService {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
    });
  }

  async fetchFeed(url: string): Promise<RSSFeed> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();
      const result = this.parser.parse(xmlText);

      // Handle both RSS and Atom feeds
      const channel = result.rss?.channel || result.feed;

      if (!channel) {
        throw new Error('Invalid RSS feed format');
      }

      // Normalize items from different feed formats
      let items = channel.item || channel.entry || [];
      if (!Array.isArray(items)) {
        items = [items];
      }

      const normalizedItems: RSSItem[] = items.map((item: any) => {
        // Handle different formats (RSS vs Atom)
        const guid = item.guid?.['#text'] || item.guid || item.id || item.link || Math.random().toString();
        const title = item.title?.['#text'] || item.title || 'Untitled';
        const description = item.description?.['#text'] || item.description || item.summary?.['#text'] || item.summary || item.content?.['#text'] || item.content || '';
        const link = item.link?.['@_href'] || item.link || item.guid || '';
        const pubDate = item.pubDate || item.published || item.updated || new Date().toISOString();
        const author = item.author?.name || item.author || item['dc:creator'] || '';
        const category = item.category;

        return {
          guid: String(guid),
          title: String(title),
          description: String(description),
          link: String(link),
          pubDate: String(pubDate),
          author: author ? String(author) : undefined,
          category: category ? (Array.isArray(category) ? category.map(String) : String(category)) : undefined,
        };
      });

      return {
        title: channel.title?.['#text'] || channel.title || 'RSS Feed',
        description: channel.description?.['#text'] || channel.description || channel.subtitle?.['#text'] || channel.subtitle || '',
        link: channel.link?.['@_href'] || channel.link || '',
        lastBuildDate: channel.lastBuildDate || channel.updated || new Date().toISOString(),
        items: normalizedItems,
      };
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      throw error;
    }
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  formatRelativeDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) {
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInHours === 0) {
          const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
          return `${diffInMinutes}m ago`;
        }
        return `${diffInHours}h ago`;
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return this.formatDate(dateString);
      }
    } catch {
      return this.formatDate(dateString);
    }
  }

  stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }
}

// Create a singleton instance
export const rssService = new RSSService();