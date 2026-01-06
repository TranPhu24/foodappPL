import AuditLog from "../models/auditLog.js";

export const auditLog = (action, resourceType) => {
  return (req, res, next) => {
    res.on("finish", async () => {
      try {
        await AuditLog.create({
          actor: req.user?.id,
          actorName: req.user?.email || "GUEST",
          action,
          resourceType,
          resourceId: req.params?.id,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          status: res.statusCode >= 400 ? "FAILURE" : "SUCCESS",
        });
      } catch (err) {
        console.error("Audit log error:", err.message);
      }
    });

    next();
  };
};
