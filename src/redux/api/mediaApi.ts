import type { ImageUrls } from "@/server/modules/media/media.service";
import { baseApi } from "./baseApi";

const mediaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    uploadImage: build.mutation<ImageUrls, File>({
      query: (file) => {
        const data = new FormData();
        data.append("file", file);
        return { url: "/admin/media", method: "POST", data };
      },
    }),
  }),
});

export const { useUploadImageMutation } = mediaApi;
