function setEmbed(title,description,colorHex,footerText,footerURL) {
    const date = new Date();
    const ano = date.getFullYear();
    const embed = {
        title: title,
        description: description,
        color: parseInt(colorHex, 16),
        timestamp: date, // Adiciona um timestamp atual
        footer: {
            text: `₢All rights reserved - ${ano} - ${footerText}`,
            icon_url: footerURL
        }
    };
    return embed;
}

module.exports = setEmbed;
