import { withSessionRoute } from "../../lib/session";

async function handler(req, res) {
  if (req.method === 'POST') {
    req.session.filteredData = req.body;
    await req.session.save();
    res.status(200).json({ message: 'Data stored successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withSessionRoute(handler);
