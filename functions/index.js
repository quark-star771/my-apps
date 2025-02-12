const notesFunctions = require('./handlers/notes');
const profileFunctions = require('./handlers/profiles');
const userFunctions = require('./handlers/users');
const forumFunctions = require('./handlers/forums');

exports.addNotePage = notesFunctions.addNotePage;
exports.getNotesPages = notesFunctions.getNotesPages;
exports.updateNotePage = notesFunctions.updateNotePage;
exports.deleteNotePage = notesFunctions.deleteNotePage;

exports.getProfiles = profileFunctions.getProfiles;
exports.getProfileByUserId = profileFunctions.getProfileByUserId;
exports.createProfile = profileFunctions.createProfile;
exports.updateProfile = profileFunctions.updateProfile;
exports.deleteProfile = profileFunctions.deleteProfile;

exports.updateLastLogin = userFunctions.updateLastLogin;
exports.getUserDocument = userFunctions.getUserDocument;
exports.createUserDocument = userFunctions.createUserDocument;

exports.createThread = forumFunctions.createThread;
exports.getThreads = forumFunctions.getThreads;
exports.addComment = forumFunctions.addComment;
exports.getComments = forumFunctions.getComments;
exports.updateComment = forumFunctions.updateComment;
exports.deleteComment = forumFunctions.deleteComment;
