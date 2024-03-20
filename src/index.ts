import { Server } from 'azle';
import { setupServer } from './setupServer';
export default Server(async () => {
  return setupServer();
});