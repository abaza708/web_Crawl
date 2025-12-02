import { describe, expect, it } from "vitest";
import { getFilenameFromUrl } from "./zipGenerator";

describe("ZIP Download Functionality", () => {
  describe("getFilenameFromUrl", () => {
    it("extracts filename from simple URL", () => {
      const url = "https://example.com/style.css";
      const filename = getFilenameFromUrl(url, 0);
      expect(filename).toBe("style.css");
    });

    it("handles URLs with paths", () => {
      const url = "https://example.com/assets/js/main.js";
      const filename = getFilenameFromUrl(url, 0);
      expect(filename).toBe("assets_js_main.js");
    });

    it("handles root path as index.html", () => {
      const url = "https://example.com/";
      const filename = getFilenameFromUrl(url, 0);
      expect(filename).toBe("index.html");
    });

    it("handles URLs without extension", () => {
      const url = "https://example.com/about";
      const filename = getFilenameFromUrl(url, 5);
      expect(filename).toBe("about_5.html");
    });

    it("handles URLs with query parameters", () => {
      const url = "https://example.com/api/data?id=123";
      const filename = getFilenameFromUrl(url, 0);
      expect(filename).toBe("api_data_0.html");
    });

    it("uses fallback for invalid URLs", () => {
      const url = "not-a-valid-url";
      const filename = getFilenameFromUrl(url, 10);
      expect(filename).toBe("file_10");
    });
  });
});
