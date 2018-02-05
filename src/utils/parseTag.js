const parseTag = tag => {
  if (Array.isArray(tag)) {
    const tags = tag.filter(
      (currentTag, i) => typeof currentTag !== 'string' || i === tag.length - 1,
    )
    return tags.length <= 1 ? tags[0] || 'span' : tags
  }
  return tag || 'span'
}

export default parseTag
