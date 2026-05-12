import axios from 'axios';

export interface VendingLead {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  category: string;
  source: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
}

export interface VendingFinderInput {
  location: string;
  category: string;
  pushToDataBridge?: boolean;
}

export interface VendingFinderResult {
  leads: VendingLead[];
  totalFound: number;
  dataBridgeStatus?: string;
}

export class VendingFinderService {
  private readonly DATABRIDGE_URL = 'https://databridge.aidigicell.com/api/leads';

  async execute(input: VendingFinderInput): Promise<VendingFinderResult> {
    const { location, category, pushToDataBridge } = input;

    // Simulate scraping / searching for leads
    // In a real scenario, this would call a Maps API or use a web scraper
    const leads = await this.searchLeads(location, category);

    let dataBridgeStatus = 'Not pushed';
    if (pushToDataBridge && leads.length > 0) {
      dataBridgeStatus = await this.pushToDataBridge(leads);
    }

    return {
      leads,
      totalFound: leads.length,
      dataBridgeStatus,
    };
  }

  private async searchLeads(location: string, category: string): Promise<VendingLead[]> {
    console.log(`[VendingFinder] Searching for ${category} in ${location}...`);
    
    // For now, we simulate finding some leads based on the input
    // This allows the user to see how the portal works immediately
    const mockLeads: VendingLead[] = [
      {
        name: `${category} Center ${location}`,
        address: `123 Main St, ${location}`,
        phone: '021-555-0101',
        website: `https://${category.toLowerCase().replace(/\s/g, '')}-${location.toLowerCase()}.com`,
        category,
        source: 'Google Maps (Simulated)',
        rating: 4.5,
      },
      {
        name: `${location} Business Tower`,
        address: `45 Business Ave, ${location}`,
        phone: '021-555-0202',
        category: 'Office',
        source: 'LinkedIn (Simulated)',
        rating: 4.2,
      },
      {
        name: `Elite ${category} Club`,
        address: `Kawasan Industri Blok B, ${location}`,
        phone: '021-555-0303',
        category,
        source: 'Yellow Pages (Simulated)',
        rating: 4.8,
      }
    ];

    // Filter or adjust mock data based on input
    return mockLeads.filter(l => 
      l.address.toLowerCase().includes(location.toLowerCase()) || 
      l.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  private async pushToDataBridge(leads: VendingLead[]): Promise<string> {
    try {
      console.log(`[VendingFinder] Pushing ${leads.length} leads to DataBridge...`);
      
      // Attempt to post to DataBridge
      // Note: This might fail if the endpoint doesn't exist yet, 
      // but we handle it gracefully for the demo.
      await axios.post(this.DATABRIDGE_URL, {
        source: 'tools.aidigicube.com',
        timestamp: new Date().toISOString(),
        leads
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'X-Source-Key': process.env.DATABRIDGE_API_KEY || 'default_key'
        }
      });

      return 'Success';
    } catch (err: any) {
      console.warn(`[VendingFinder] DataBridge push failed: ${err.message}`);
      return `Failed: ${err.message} (Is DataBridge endpoint ready?)`;
    }
  }
}
