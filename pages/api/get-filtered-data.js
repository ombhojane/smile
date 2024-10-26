import { withSessionRoute } from "../../lib/session";

async function handler(req, res) {
  if (req.method === 'GET') {
    const filteredData = req.session.filteredData || [];
    res.status(200).json(filteredData);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withSessionRoute(handler);
