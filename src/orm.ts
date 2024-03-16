import { EntityManager, MikroORM } from '@mikro-orm/postgresql' // or any other driver package

import config from './mikro-orm.config'
const orm = await MikroORM.init(config)
export const getEntityManager = () => orm.em.fork() as EntityManager
