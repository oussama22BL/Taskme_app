export const mapMongoId = <T extends Record<string, any>>(doc: T): T & { id?: string } => {
  const { _id, id, ...rest } = doc as any;
  return { ...(rest as any), id: id ?? (_id ? String(_id) : undefined) } as any;
};

export const mapMongoArray = <T extends Record<string, any>>(arr: T[]) => arr.map(mapMongoId);
