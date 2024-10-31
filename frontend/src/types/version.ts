export type VersionType = 'quotation' | 'price_table';

export interface VersionChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface Version {
  id: string;
  versionNumber: string;
  resourceType: VersionType;
  resourceId: string;
  changes: VersionChange[];
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  comment?: string;
}

export interface VersionDiff {
  version1: Version;
  version2: Version;
  changes: VersionChange[];
}

export interface VersionCompareOptions {
  showAllFields: boolean;
  showMetadata: boolean;
  highlightChanges: boolean;
}