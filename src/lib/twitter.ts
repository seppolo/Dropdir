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

export interface TwitterUserInfo {
  username: string;
  profileImage: string | null;
  displayName?: string;
  bio?: string;
  found: boolean;
}

export async function getTwitterUserInfo(
  twitterUrl: string,
): Promise<TwitterUserInfo> {
  if (!twitterUrl) return { username: "", profileImage: null, found: false };

  try {
    const username = extractTwitterUsername(twitterUrl);
    if (!username) return { username: "", profileImage: null, found: false };

    // Get profile image
    const profileImage = await getTwitterProfileImageFromUrl(twitterUrl);

    // Try to fetch additional user information
    let displayName = username;
    let bio = "";

    try {
      // Fetch the SocialBlade page to extract more information
      const response = await fetch(
        `https://socialblade.com/twitter/user/${username}`,
      );
      const html = await response.text();

      // Extract display name using regex
      const displayNameRegex = /<h1[^>]*>([^<]+)<\/h1>/;
      const displayNameMatch = html.match(displayNameRegex);
      if (displayNameMatch && displayNameMatch[1]) {
        displayName = displayNameMatch[1].trim();
      }

      // Extract bio using regex
      const bioRegex = /<div[^>]*class="bio"[^>]*>([^<]+)<\/div>/;
      const bioMatch = html.match(bioRegex);
      if (bioMatch && bioMatch[1]) {
        bio = bioMatch[1].trim();
      }
    } catch (fetchError) {
      console.error("Error fetching additional Twitter user info:", fetchError);
      // Continue with what we have
    }

    return {
      username,
      profileImage,
      displayName,
      bio,
      found: true,
    };
  } catch (error) {
    console.error("Error fetching Twitter user info:", error);
    return { username: "", profileImage: null, found: false };
  }
}
