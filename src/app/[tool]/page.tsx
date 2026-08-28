import Home from "../page";

interface PageProps {
    params: Promise<{ tool: string }> | { tool: string };
}

export default async function ToolPage({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params);
    const rawTool = resolvedParams?.tool?.toLowerCase() || null;
    
    // Normalize aliases (e.g. /voice -> 'audio', /torch -> 'flashlight')
    const tool = rawTool === 'voice' ? 'audio' : rawTool === 'torch' ? 'flashlight' : rawTool;

    return <Home initialTool={tool} />;
}
