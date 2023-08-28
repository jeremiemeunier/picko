const removeMessage = async (message) => {
    await message.delete();
}

module.exports = { removeMessage }