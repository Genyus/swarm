import type { {{ApiType}} } from "wasp/server/api";

export const {{apiName}}: {{ApiType}} = async (req, res, context) => {
  {{AuthCheck}}
  // TODO: Implement your API logic here
  res.json({ message: "OK" });
};
