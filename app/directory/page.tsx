import { parseDirectory } from "@/lib/parse-directory";
import DirectoryClient from "./directory-client";

export default function DirectoryPage() {
  const { resources, categories } = parseDirectory();
  return <DirectoryClient resources={resources} categories={categories} />;
}