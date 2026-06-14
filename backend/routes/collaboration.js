const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { users, collaborators, invitations, changeRequests, versionHistory } = require('../data/mockData');

let collaboratorsData = JSON.parse(JSON.stringify(collaborators));
let invitationsData = [...invitations];
let changeRequestsData = [...changeRequests];
let versionHistoryData = [...versionHistory];

router.get('/:worldId/members', (req, res) => {
  const { worldId } = req.params;
  const members = collaboratorsData[worldId] || [];
  res.json({ members });
});

router.post('/:worldId/invite', (req, res) => {
  const { worldId } = req.params;
  const { inviteeId, inviteeName, role, categories, inviterId, inviterName, worldName } = req.body;

  const existing = (collaboratorsData[worldId] || []).find(m => m.userId === inviteeId);
  if (existing) {
    return res.status(400).json({ message: '该用户已是协作者' });
  }

  const pendingInvite = invitationsData.find(
    inv => inv.worldId === worldId && inv.inviteeId === inviteeId && inv.status === 'pending'
  );
  if (pendingInvite) {
    return res.status(400).json({ message: '该用户已有待处理的邀请' });
  }

  const invitation = {
    id: `invite-${uuidv4()}`,
    worldId,
    worldName,
    inviterId,
    inviterName,
    inviteeId,
    inviteeName,
    role: role || 'editor',
    categories: categories || [],
    status: 'pending',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    respondedAt: null
  };

  invitationsData.push(invitation);
  res.status(201).json(invitation);
});

router.put('/:worldId/members/:memberId', (req, res) => {
  const { worldId, memberId } = req.params;
  const { role, permissions, categories } = req.body;

  const members = collaboratorsData[worldId] || [];
  const member = members.find(m => m.id === memberId);
  if (!member) {
    return res.status(404).json({ message: '协作者不存在' });
  }

  if (member.role === 'owner') {
    return res.status(403).json({ message: '不能修改主理人角色' });
  }

  if (role !== undefined) member.role = role;
  if (permissions !== undefined) member.permissions = permissions;
  if (categories !== undefined) member.categories = categories;

  res.json(member);
});

router.delete('/:worldId/members/:memberId', (req, res) => {
  const { worldId, memberId } = req.params;

  const members = collaboratorsData[worldId] || [];
  const memberIndex = members.findIndex(m => m.id === memberId);
  if (memberIndex === -1) {
    return res.status(404).json({ message: '协作者不存在' });
  }

  if (members[memberIndex].role === 'owner') {
    return res.status(403).json({ message: '不能移除主理人' });
  }

  members.splice(memberIndex, 1);
  res.json({ message: '已移除协作者' });
});

router.get('/:worldId/invitations', (req, res) => {
  const { worldId } = req.params;
  const { status } = req.query;
  let result = invitationsData.filter(inv => inv.worldId === worldId);
  if (status) {
    result = result.filter(inv => inv.status === status);
  }
  res.json({ invitations: result });
});

router.post('/:worldId/invitations/:inviteId/respond', (req, res) => {
  const { worldId, inviteId } = req.params;
  const { accept } = req.body;

  const invitation = invitationsData.find(
    inv => inv.id === inviteId && inv.worldId === worldId && inv.status === 'pending'
  );
  if (!invitation) {
    return res.status(404).json({ message: '邀请不存在或已处理' });
  }

  invitation.status = accept ? 'accepted' : 'rejected';
  invitation.respondedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

  if (accept) {
    if (!collaboratorsData[worldId]) {
      collaboratorsData[worldId] = [];
    }
    const rolePermissions = {
      owner: ['read', 'write', 'review', 'manage'],
      reviewer: ['read', 'review'],
      editor: ['read', 'write']
    };
    const newMember = {
      id: `collab-${uuidv4()}`,
      worldId,
      userId: invitation.inviteeId,
      username: invitation.inviteeName,
      avatar: users.find(u => u.id === invitation.inviteeId)?.avatar || '👤',
      role: invitation.role,
      permissions: rolePermissions[invitation.role] || ['read', 'write'],
      categories: invitation.categories || [],
      joinedAt: new Date().toISOString().split('T')[0]
    };
    collaboratorsData[worldId].push(newMember);
  }

  res.json({ invitation, accepted: accept });
});

router.get('/:worldId/changes', (req, res) => {
  const { worldId } = req.params;
  const { status, type } = req.query;
  let result = changeRequestsData.filter(cr => cr.worldId === worldId);
  if (status) {
    result = result.filter(cr => cr.status === status);
  }
  if (type) {
    result = result.filter(cr => cr.type === type);
  }
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ changes: result });
});

router.post('/:worldId/changes', (req, res) => {
  const { worldId } = req.params;
  const { entryId, entryTitle, type, summary, oldValue, newValue, requestedBy, requesterName, requesterAvatar } = req.body;

  const changeRequest = {
    id: `change-${uuidv4()}`,
    worldId,
    entryId: entryId || null,
    entryTitle: entryTitle || null,
    requestedBy,
    requesterName,
    requesterAvatar,
    type,
    status: 'pending',
    summary,
    oldValue: oldValue || null,
    newValue,
    reviewedBy: null,
    reviewerName: null,
    reviewComment: null,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reviewedAt: null
  };

  changeRequestsData.push(changeRequest);
  res.status(201).json(changeRequest);
});

router.put('/:worldId/changes/:changeId/review', (req, res) => {
  const { worldId, changeId } = req.params;
  const { approved, reviewComment, reviewedBy, reviewerName } = req.body;

  const changeRequest = changeRequestsData.find(
    cr => cr.id === changeId && cr.worldId === worldId && cr.status === 'pending'
  );
  if (!changeRequest) {
    return res.status(404).json({ message: '变更请求不存在或已处理' });
  }

  changeRequest.status = approved ? 'approved' : 'rejected';
  changeRequest.reviewedBy = reviewedBy;
  changeRequest.reviewerName = reviewerName;
  changeRequest.reviewComment = reviewComment || null;
  changeRequest.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

  if (approved) {
    const newVersion = {
      id: `version-${uuidv4()}`,
      worldId,
      version: (versionHistoryData.filter(v => v.worldId === worldId).length || 0) + 1,
      changeType: changeRequest.type,
      changeSummary: changeRequest.summary,
      changeRequestId: changeRequest.id,
      changedBy: reviewedBy,
      changerName: reviewerName,
      changerAvatar: users.find(u => u.id === reviewedBy)?.avatar || '👤',
      entries: changeRequest.newValue ? [changeRequest.newValue] : [],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    versionHistoryData.push(newVersion);
  }

  res.json({ changeRequest, approved });
});

router.get('/:worldId/versions', (req, res) => {
  const { worldId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  let result = versionHistoryData.filter(v => v.worldId === worldId);
  result.sort((a, b) => b.version - a.version);

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedResult = result.slice(start, end);

  res.json({
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
    versions: paginatedResult
  });
});

router.get('/:worldId/versions/:versionId', (req, res) => {
  const { worldId, versionId } = req.params;
  const version = versionHistoryData.find(v => v.id === versionId && v.worldId === worldId);
  if (!version) {
    return res.status(404).json({ message: '版本不存在' });
  }
  res.json(version);
});

router.post('/:worldId/versions/:versionId/rollback', (req, res) => {
  const { worldId, versionId } = req.params;
  const { rolledBackBy, rolledBackName } = req.body;

  const version = versionHistoryData.find(v => v.id === versionId && v.worldId === worldId);
  if (!version) {
    return res.status(404).json({ message: '版本不存在' });
  }

  const rollbackVersion = {
    id: `version-${uuidv4()}`,
    worldId,
    version: (versionHistoryData.filter(v => v.worldId === worldId).length || 0) + 1,
    changeType: 'rollback',
    changeSummary: `回滚至版本 ${version.version}：${version.changeSummary}`,
    rolledBackFromVersion: version.version,
    changedBy: rolledBackBy,
    changerName: rolledBackName,
    changerAvatar: users.find(u => u.id === rolledBackBy)?.avatar || '👤',
    entries: version.entries,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  versionHistoryData.push(rollbackVersion);
  res.json({ rollbackVersion });
});

module.exports = router;
