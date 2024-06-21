// Mongoose options

export const MONGOOSE_OPTIONS = {
  // mongos: true,
  //   poolSize: 10,
  socketTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  //   useCreateIndex: true,
  noDelay: true,
  retryWrites: true,
};

export const LOCAL_URL = process.env.LOCAL_URL;
