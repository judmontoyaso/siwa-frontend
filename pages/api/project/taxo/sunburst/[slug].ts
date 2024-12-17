
  // app/api/proxy/[slug]/route.ts
  export const dynamic = 'force-dynamic' // defaults to auto
  import type { NextApiRequest, NextApiResponse } from 'next'
  
  const handler = async (req: {
      body: {
          top: any;
          selectedValue: any;
          selectedRank: any;
          selectedGroup: any;
          number: any;
          column: { column: any; };
          selectedColorGroup: any;
          columnValues: { columnValues: any; };
            nickname: { nickname: any; };
          samplelocation: { selectedLocations: any; }; selectedLocation: any; selectedColumn: any; 
}; query: { slug: any; }; headers: { authorization: any; }; 
}, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
      const { slug } = req.query;
      const token = req.headers.authorization;
      
      const  selectedColumn  = req.body.selectedColumn;
      const  selectedLocation  = req.body.selectedLocation;
      const selectedRank  = req.body.selectedRank;
      const selectedGroup  = req.body.selectedGroup;
      const top  = req.body.top.toString();
      const columnValues  = req.body.columnValues;
      const nickname = req.body.nickname;
      const selectedColorGroup = req.body.selectedColorGroup;

      try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/sunbursttaxo/${slug}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify({
                "selectedColumn": selectedColumn,
                "selectedLocation": selectedLocation,
                "selectedRank": selectedRank,
                "selectedGroup": selectedGroup,
                "top": top,
                "columnValues": columnValues,
                "nickname": nickname,
                "selectedColorGroup": selectedColorGroup,


            })
        }
        );
    
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      res.status(200).json(data);
  } catch (error: any) {
      res.status(500).json({ error: error.message });
  }
  }
  export default handler