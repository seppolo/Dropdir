export async function getTwitterProfileImageFromUrl(
  twitterUrl: string,
): Promise<string | null> {
  if (!twitterUrl) return null;
  try {
    const urlObj = new URL(twitterUrl);
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === "twitter.com" || hostname === "x.com") {
      const username = urlObj.pathname.split("/").filter(Boolean)[0];
      if (username) {
        try {
          // Fetch the SocialBlade page
          const response = await fetch(
            `https://socialblade.com/twitter/user/${username}`,
          );
          const html = await response.text();

          // Use regex to extract the profile image URL
          const regex =
            /https:\/\/pbs\.twimg\.com\/profile_images\/[\w-]+\/[\w-]+\.[a-zA-Z]+/g;
          const match = html.match(regex);

          if (match && match[0]) {
            return match[0];
          }
        } catch (fetchError) {
          console.error("Error fetching from SocialBlade:", fetchError);
        }

        // Fallback to default avatar URL
        return `https://unavatar.io/twitter/${username}`;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function extractTwitterUsername(twitterUrl: string): string | null {
  if (!twitterUrl) return null;
  try {
    const urlObj = new URL(twitterUrl);
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === "twitter.com" || hostname === "x.com") {
      return urlObj.pathname.split("/").filter(Boolean)[0];
    }
    return null;
  } catch (error) {
    return null;
  }
}
