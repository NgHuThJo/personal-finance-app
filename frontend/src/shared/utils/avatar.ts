import { Avatar } from "@dicebear/core";
import adventurer from "@dicebear/styles/adventurer.json" with { type: "json" };
import botts from "@dicebear/styles/bottts.json" with { type: "json" };
import lorelei from "@dicebear/styles/lorelei.json" with { type: "json" };
import pixelArt from "@dicebear/styles/pixel-art.json" with { type: "json" };
import type { AvatarStyle } from "#frontend/shared/client";

class DiceBearHelper {
  getStyle(style: AvatarStyle) {
    switch (style) {
      case "Adventurer": {
        return adventurer;
      }
      case "Bottts": {
        return botts;
      }
      case "Pixel_Art": {
        return pixelArt;
      }
      case "Lorelei": {
        return lorelei;
      }
    }
  }

  createAvatarString(style: AvatarStyle, seed: string) {
    const styleObject = this.getStyle(style);

    const avatar = new Avatar(styleObject, {
      seed,
    });

    return avatar.toDataUri();
  }
}

export const diceBearerHelper = new DiceBearHelper();
