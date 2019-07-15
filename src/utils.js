const getProjectName = (projectItem) => {
  return projectItem.title.replace('Edit', '');
}

export {
  getProjectName
}