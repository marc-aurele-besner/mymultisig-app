import TDateManagement from '../../types/date'

const dateManagement = (account: string, isUpdate = false as boolean) => {
  const date = new Date()
  if (isUpdate)
    return {
      lastUpdated: date,
      lastUpdatedBy: account,
    }
  const data: TDateManagement = {
    dateAdded: date,
    addedBy: account,
    lastUpdated: date,
    lastUpdatedBy: '0x0000000000000000000000000000000000000000',
  }
  return data
}

export default dateManagement
