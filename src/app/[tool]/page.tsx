import Home from "../page";

interface PageProps {
    params: Promise<{ tool: string }> | { tool: string };
}

export default async function ToolPage({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params);
    const rawTool = resolvedParams?.tool?.toLowerCase() || null;
    
    // Normalize aliases (e.g. /voice -> 'audio', /torch -> 'flashlight', /filemanager -> 'files', /wavoice -> 'wavoice')
    const tool = rawTool === 'voice' ? 'audio' 
        : rawTool === 'torch' ? 'flashlight' 
        : (rawTool === 'filemanager' || rawTool === 'file' || rawTool === 'explorer') ? 'files'
        : (rawTool === 'wavoice' || rawTool === 'whatsapp-voice' || rawTool === 'whatsappvoice' || rawTool === 'whatsapp' || rawTool === 'wa-voice') ? 'wavoice'
        : rawTool;

    return <Home initialTool={tool} />;
}
