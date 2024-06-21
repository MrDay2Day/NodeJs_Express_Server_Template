import express from "express";
const routes = express.Router();

import demoRouter from "./routers/demoRouter";
import Misc from "./routers/utils/misc";

routes.use("/demo", demoRouter);
routes.use("/", Misc.ping);

routes.use(Misc.sysError);
routes.use(Misc.error404);

export default routes;
