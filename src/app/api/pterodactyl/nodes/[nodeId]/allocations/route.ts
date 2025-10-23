import { NextRequest, NextResponse } from 'next/server';
import { createPterodactylClient } from '@/lib/pterodactyl';

export async function GET(
  request: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { nodeId } = params;

    if (!nodeId) {
      return NextResponse.json(
        { success: false, error: 'Node ID is required' },
        { status: 400 }
      );
    }

    // Initialize Pterodactyl client
    const pterodactyl = createPterodactylClient({
      panelUrl: process.env.PTERODACTYL_PANEL_URL || '',
      apiKey: process.env.PTERODACTYL_API_KEY || '',
    });

    // Test connection
    const isConnected = await pterodactyl.testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Pterodactyl panel' },
        { status: 500 }
      );
    }

    // Get node details with allocations
    const nodeData = await pterodactyl.getNode(parseInt(nodeId));
    
    // Get all allocations for this node
    const allocations = nodeData.data.allocations || [];

    return NextResponse.json({
      success: true,
      node: nodeData.data,
      alloc: allocations,
      count: allocations.length,
    });

  } catch (error) {
    console.error('Error fetching node allocations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch node allocations' 
      },
      { status: 500 }
    );
  }
}