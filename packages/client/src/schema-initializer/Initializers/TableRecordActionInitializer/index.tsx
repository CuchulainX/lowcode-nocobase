import { observer, Schema, useFieldSchema } from '@formily/react';
import { Switch } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SchemaInitializer } from '../..';
import { useAPIClient } from '../../../api-client';
import { createDesignable, useDesignable } from '../../../schema-component';

const useCurrentActionSchema = (action: string) => {
  const fieldSchema = useFieldSchema();
  const { remove } = useDesignable();
  const findActionSchema = (schema: Schema) => {
    return schema.reduceProperties((buf, s) => {
      if (s['x-action'] === action) {
        return s;
      }
      const c = findActionSchema(s);
      if (c) {
        return c;
      }
      return buf;
    });
  };
  const schema = findActionSchema(fieldSchema);
  return {
    schema,
    exists: !!schema,
    remove() {
      schema && remove(schema);
    },
  };
};

const InitializeViewAction = SchemaInitializer.itemWrap((props) => {
  const { item, insert } = props;
  const { exists, remove } = useCurrentActionSchema(item.schema['x-action']);
  return (
    <SchemaInitializer.Item
      onClick={() => {
        console.log('InitializeAction', insert);
        if (exists) {
          return remove();
        }
        insert({
          type: 'void',
          'x-component': 'Action.Link',
          ...item.schema,
        });
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {item.title} <Switch style={{ marginLeft: 20 }} size={'small'} checked={exists} />
      </div>
    </SchemaInitializer.Item>
  );
});

const InitializeAction = SchemaInitializer.itemWrap((props) => {
  const { item, insert } = props;
  const { exists, remove } = useCurrentActionSchema(item.schema['x-action']);
  return (
    <SchemaInitializer.Item
      onClick={() => {
        console.log('InitializeAction', insert);
        if (exists) {
          return remove();
        }
        insert({
          type: 'void',
          'x-designer': 'TestDesigner',
          'x-component': 'Action.Link',
          ...item.schema,
        });
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {item.title} <Switch style={{ marginLeft: 20 }} size={'small'} checked={exists} />
      </div>
    </SchemaInitializer.Item>
  );
});

export const TableRecordActionInitializer = observer((props: any) => {
  const fieldSchema = useFieldSchema();
  const api = useAPIClient();
  const { refresh } = useDesignable();
  const { t } = useTranslation();
  return (
    <SchemaInitializer.Button
      insertPosition={'beforeEnd'}
      insert={(schema) => {
        const spaceSchema = fieldSchema.reduceProperties((buf, schema) => {
          if (schema['x-component'] === 'Space') {
            return schema;
          }
          return buf;
        }, null);
        if (!spaceSchema) {
          return;
        }
        const dn = createDesignable({
          api,
          refresh,
          current: spaceSchema,
        });
        dn.loadAPIClientEvents();
        dn.insertBeforeEnd(schema);
      }}
      items={[
        {
          type: 'itemGroup',
          title: t('Enable actions'),
          children: [
            {
              type: 'item',
              title: t('View'),
              component: InitializeViewAction,
              schema: {
                title: '{{ t("View") }}',
                type: 'void',
                'x-action': 'view',
                'x-component': 'Action.Link',
                'x-component-props': {},
                properties: {
                  drawer: {
                    type: 'void',
                    'x-component': 'Action.Drawer',
                    title: '{{ t("View record") }}',
                    properties: {
                      tabs: {
                        type: 'void',
                        'x-component': 'Tabs',
                        'x-component-props': {},
                        properties: {
                          tab1: {
                            type: 'void',
                            title: '详情',
                            'x-component': 'Tabs.TabPane',
                            'x-component-props': {},
                            properties: {
                              grid: {
                                type: 'void',
                                'x-decorator': 'Form',
                                'x-component': 'Grid',
                                'x-read-pretty': true,
                                'x-item-initializer': 'RecordBlockInitializer',
                                properties: {},
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              type: 'item',
              title: t('Edit'),
              component: InitializeAction,
              schema: {
                title: '{{ t("Edit") }}',
                type: 'void',
                'x-action': 'update',
                'x-component': 'Action.Link',
                'x-component-props': {},
                properties: {
                  drawer: {
                    type: 'void',
                    'x-component': 'Action.Drawer',
                    title: '{{ t("Edit record") }}',
                    properties: {},
                  },
                },
              },
            },
            {
              type: 'item',
              title: t('Delete'),
              component: InitializeAction,
              schema: {
                title: '{{ t("Delete") }}',
                'x-action': 'destroy',
                'x-component-props': {
                  useAction: '{{ useDestroyAction }}',
                },
              },
            },
          ],
        },
      ]}
    >
      Configure
    </SchemaInitializer.Button>
  );
});