import { parseError } from "$src/utils/misc";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "GET") {
		try {
			const revalidated = [];
			if (req.query.path) {
				let paths = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
				for (let i in paths) {
					await res.revalidate(paths[i]);
					revalidated.push(paths[i]);
				}
			}
			res.status(200).json({
				revalidated
			});
		} catch (err) {
			res.status(500).json({ success: false, statusCode: 500, message: parseError(err) });
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("Method Not Allowed");
	}
}
