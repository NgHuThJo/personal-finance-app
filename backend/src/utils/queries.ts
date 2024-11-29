export const postsWithComments = `WITH RECURSIVE PostHierarchy AS (
        SELECT
          p.id AS "postId",
          p.title,
          p.content,
          p."createdAt",
          p."updatedAt",
          p."parentPostId",
          p."authorId",
          u.id AS "userId",
          u.email AS "userEmail",
          u.name AS "userName",
          0 AS level
        FROM "Post" p
        JOIN "User" u ON p."authorId" = u.id
        WHERE p."parentPostId" IS NULL
      
        UNION ALL
      
        SELECT
          p.id AS "postId",
          p.title,
          p.content,
          p."createdAt",
          p."updatedAt",
          p."parentPostId",
          p."authorId",
          u.id AS "userId",
          u.email AS "userEmail",
          u.name AS "userName",
          ph.level + 1 AS level
        FROM "Post" p
        JOIN "User" u ON p."authorId" = u.id
        JOIN PostHierarchy ph ON p."parentPostId" = ph."postId"
      )
      
      SELECT
        ph.title,
        ph.content,
        ph."createdAt",
        ph."updatedAt",
        ph."authorId",
        JSON_BUILD_OBJECT('id', ph."userId", 'email', ph."userEmail", 'name', ph."userName") AS author,
        (SELECT COUNT(*)::INT FROM "Post" p WHERE p."parentPostId" = ph."userId") AS "commentsCount",
        (SELECT COUNT(*)::INT FROM "Like" l WHERE l."postId" = ph."userId") AS "likesCount"
      FROM PostHierarchy ph
      ORDER BY ph.level, ph."createdAt" DESC`;
