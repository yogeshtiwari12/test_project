import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';


export default defineSchema({

  files: defineTable({
    filetype: v.string(), 
    filesize: v.number(), 
    filename: v.string(), 
    userid:   v.string(),
    storageId: v.id("_storage"),  // Convex storage reference
  }),
   
  userfilespace: defineTable({
    space: v.number(),  
    userid : v.string(), 
  }),

});