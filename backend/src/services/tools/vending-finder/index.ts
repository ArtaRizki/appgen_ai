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
    console.log(`[VendingFinder] Searching for ${category} in ${location} using Overpass API...`);
    
    try {
      let tagQuery = '';
      switch (category.toLowerCase()) {
        case 'office':
          tagQuery = '["office"]';
          break;
        case 'gym':
          tagQuery = '["leisure"="fitness_centre"]';
          break;
        case 'hospital':
          tagQuery = '["amenity"~"hospital|clinic"]';
          break;
        case 'apartment':
          tagQuery = '["building"="apartments"]';
          break;
        case 'school':
          tagQuery = '["amenity"~"school|university|college"]';
          break;
        default:
          tagQuery = '["office"]';
      }

      // Overpass QL query
      const query = `
        [out:json][timeout:25];
        area[name~"${location}", i]->.searchArea;
        (
          node${tagQuery}(area.searchArea);
          way${tagQuery}(area.searchArea);
          relation${tagQuery}(area.searchArea);
        );
        out center 20;
      `;

      const response = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });

      if (!response.data || !response.data.elements) {
        return [];
      }

      const leads: VendingLead[] = [];
      for (const el of response.data.elements) {
        if (el.tags && el.tags.name) {
          leads.push({
            name: el.tags.name,
            address: el.tags['addr:street'] 
              ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}, ${location}`.trim()
              : `${location} Area`,
            phone: el.tags.phone || el.tags['contact:phone'] || undefined,
            website: el.tags.website || el.tags['contact:website'] || undefined,
            category: category,
            source: 'OpenStreetMap',
            latitude: el.lat || (el.center && el.center.lat) || undefined,
            longitude: el.lon || (el.center && el.center.lon) || undefined,
          });
        }
      }

      return leads;
    } catch (err: any) {
      console.warn(`[VendingFinder] Overpass API failed: ${err.message}. Falling back to mock data.`);
      // Fallback to mock data if API fails
      return [
        {
          name: `${category} Center ${location} (Fallback)`,
          address: `123 Main St, ${location}`,
          phone: '021-555-0101',
          category,
          source: 'System Fallback',
        }
      ];
    }
  }

  private async pushToDataBridge(leads: VendingLead[]): Promise<string> {
    try {
      console.log(`[VendingFinder] Pushing ${leads.length} leads to DataBridge...`);
      
      // Attempt to post to DataBridge
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
      return `Failed: DataBridge offline`;
    }
  }
}
