import { resourceMetadata } from "@/lib/portfolio-resources";
import ResourceView from "./ResourceView";
export const metadata=resourceMetadata();
export default function Page(){return <ResourceView/>;}
