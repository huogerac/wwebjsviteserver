export async function fetchChatsAndMessages(client) {
  console.log('============ fetch chats')
  const response = []
  try {
    //const chats = await client.listChats();
    const chats = await client.getAllChats();
    console.log('Chats length:', chats.length);
    for (const chat of chats) {
      let _newChat = {
        id: chat.id._serialized,
        name: chat.name,
        isGroup: chat.isGroup,
        isReadOnly: chat.isReadOnly,
        unreadCount: chat.unreadCount,
        timestamp: chat.t,
        archived: chat.archived,
        messages: [],
        contact: {
          type: chat.contact.type,
          verifiedName: chat.contact.verifiedName,
          isBusiness: chat.contact.isBusiness,
          isEnterprise: chat.contact.isEnterprise,
          verifiedLevel: chat.contact.verifiedLevel,
          formattedName: chat.contact.formattedName,
          isMe: chat.contact.isMe,
          isMyContact: chat.contact.isMyContact,
          isPSA: chat.contact.isPSA,
          isUser: chat.contact.isUser,
          isWAContact: chat.contact.isWAContact,
        }
      }

      // https://wppconnect.io/wppconnect/interfaces/GetMessagesParam.html
      const messageParams = {
          count: 20,
      }
      const messages = await client.getMessages(chat.id._serialized, messageParams);
      console.log('     ');
      console.log('=========_newChat:', _newChat.id);
      console.log('messages length:', messages.length);
      for (const _msg of messages) {
        //console.log('=========message:', _msg);

        if (!_newChat.img && _msg.sender.profilePicThumbObj && _msg.sender.profilePicThumbObj.img) {
          _newChat.img = _msg.sender.profilePicThumbObj.img
        }

        const newMsg = {
          chatId: chat.id._serialized,
          viewed: _msg.viewed,
          body: _msg.body,
          type: _msg.type,
          from: _msg.from,
          to: _msg.to,
          ack: _msg.ack,
          star: _msg.star,
          kicNotified: _msg.kicNotified,
          isFromTemplate: _msg.isFromTemplate,
          // pollOptions: _msg.pollOptions,
          // pollInvalidated: _msg.pollInvalidated,
          // pollVotesSnapshot: _msg.pollVotesSnapshot,
          // latestEditMsgKey: _msg.latestEditMsgKey,
          // latestEditSenderTimestampMs: _msg.latestEditSenderTimestampMs,
          // mentionedJidList: _msg.mentionedJidList,
          // groupMentions: _msg.groupMentions,
          // eventInvalidated: _msg.eventInvalidated,
          // isVcardOverMmsDocument: _msg.isVcardOverMmsDocument,
          // isForwarded: _msg.isForwarded,
          labels: _msg.labels,
          hasReaction: _msg.hasReaction,
          viewMode: _msg.viewMode,
          //productHeaderImageRejected: _msg.productHeaderImageRejected,
          lastPlaybackProgress: _msg.lastPlaybackProgress,
          isDynamicReplyButtonsMsg: _msg.isDynamicReplyButtonsMsg,
          isCarouselCard: _msg.isCarouselCard,
          parentMsgId: _msg.parentMsgId,
          isMdHistoryMsg: _msg.isMdHistoryMsg,
          stickerSentTs: _msg.stickerSentTs,
          isAvatar: _msg.isAvatar,
          lastUpdateFromServerTs: _msg.lastUpdateFromServerTs,
          invokedBotWid: _msg.invokedBotWid,
          // bizBotType: _msg.bizBotType,
          // botResponseTargetId: _msg.botResponseTargetId,
          // botPluginType: _msg.botPluginType,
          // botPluginReferenceIndex: _msg.botPluginReferenceIndex,
          // botPluginSearchProvider: _msg.botPluginSearchProvider,
          // botPluginSearchUrl: _msg.botPluginSearchUrl,
          // botPluginSearchQuery: _msg.botPluginSearchQuery,
          // botPluginMaybeParent: _msg.botPluginMaybeParent,
          // botReelPluginThumbnailCdnUrl: _msg.botReelPluginThumbnailCdnUrl,
          // botMsgBodyType: _msg.botMsgBodyType,
          requiresDirectConnection: _msg.requiresDirectConnection,
          bizContentPlaceholderType: _msg.bizContentPlaceholderType,
          hostedBizEncStateMismatch: _msg.hostedBizEncStateMismatch,
          senderOrRecipientAccountTypeHosted: _msg.senderOrRecipientAccountTypeHosted,
          placeholderCreatedWhenAccountIsHosted: _msg.placeholderCreatedWhenAccountIsHosted,
          fromMe: _msg.fromMe,
          sender: _msg.sender,
          timestamp: _msg.timestamp,
          content: _msg.content,
          isGroupMsg: _msg.isGroupMsg,
          mediaData: _msg.mediaData,
        }
        //console.log('message===============');
        //console.log(newMsg);
        _newChat.messages.push(newMsg)
      }
      response.push(_newChat)
    }
    console.log('========= response:');
    return response

  } catch (error) {
    console.error('Error fetching chats or messages:', error);
  }
}




//let client = null
// async function fetchChatsAndMessages(client) {
//   console.log('============ fetch chats')
//   try {
//     const chats = await client.listChats();
//     console.log('Chats:', chats);

//     for (const chat of chats) {
//       const messages = await client.getAllMessagesInChat(chat.id._serialized);
//       console.log(`Messages in chat ${chat.id._serialized}:`, messages);
//     }
//   } catch (error) {
//     console.error('Error fetching chats or messages:', error);
//   }
// }