/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observer } from 'mobx-react-lite';
import styled, { css } from 'reshadow';

import { DBObject, DBObjectResource, NavTreeResource } from '@cloudbeaver/core-app';
import { Loader, TextPlaceholder, useMapResource } from '@cloudbeaver/core-blocks';
import { useTranslate } from '@cloudbeaver/core-localization';
import { resourceKeyList } from '@cloudbeaver/core-sdk';

import { ObjectChildrenPropertyTable } from './ObjectChildrenPropertyTable';

const styles = css`
  div {
    flex: auto;
    overflow: hidden;
  }
  ExceptionMessage {
    padding: 24px;
  }
`;

interface ObjectPropertyTableProps {
  objectId: string;
  parentId: string;
  parents: string[];
}

export const ObjectPropertyTable = observer<ObjectPropertyTableProps>(function ObjectPropertyTable({
  objectId,
  parentId,
  parents,
}) {
  parents = [...parents, parentId];
  const translate = useTranslate();
  const tree = useMapResource(ObjectPropertyTable, NavTreeResource, objectId, {
    onLoad: async resource => !(await resource.preloadNodeParents(parents, objectId)),
  });
  const key = resourceKeyList(tree.data || []);
  const dbObject = useMapResource(ObjectPropertyTable, DBObjectResource, key, {
    async onLoad(resource: DBObjectResource) {
      const preloaded = await tree.resource.preloadNodeParents(parents, objectId);

      if (!preloaded) {
        return true;
      }

      await resource.loadChildren(objectId, key);
      return true;
    },
    preload: [tree],
  });

  const objects = dbObject.data as DBObject[];

  return styled(styles)(
    <Loader state={[tree, dbObject]} style={styles}>{() => styled(styles)(
      <>
        {!tree.data || tree.data.length === 0 ? (
          <TextPlaceholder>{translate('plugin_object_viewer_table_no_items')}</TextPlaceholder>
        ) : (
          <div>
            <ObjectChildrenPropertyTable objects={objects} />
          </div>
        )}
      </>
    )}
    </Loader>
  );
});
