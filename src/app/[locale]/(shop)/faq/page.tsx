import { cmsRoute } from "@/components/storefront/content/cms-page";

// Content managed in Admin → Pages (slug "faq").
const { generateMetadata, CmsPage } = cmsRoute("faq");

export { generateMetadata };
export default CmsPage;
