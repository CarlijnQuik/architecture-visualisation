import pymongo
from datetime import datetime, date
import pandas as pd


def get_package_nodes(nodes):

    # Rename name and parent to one abstraction level higher
    for node in nodes:
        node['name'] = '.'.join(str(node['name']).split('/')[:-1])
        node['parent'] = '.'.join(str(node['parent']).split('/')[:-1])

    df_nodes = pd.DataFrame(nodes)  # create dataframe
    nodes_list = df_nodes['name'].tolist()

    # Filter out the unique nodes
    unique_nodes = get_unique_values(nodes, 'name')

    for unique_node in unique_nodes:
        unique_node['count'] = int(nodes_list.count(unique_node['name']))

    return unique_nodes


def get_package_links(links):
    # Rename source and target to one abstraction level higher
    for link in links:
        link['source'] = '.'.join(link['source'].split('/')[:-1])
        link['target'] = '.'.join(link['target'].split('/')[:-1])
        link['linkID'] = link['source'] + link['target']

    df_links = pd.DataFrame(links)  # create dataframe
    links_list = df_links['linkID'].tolist()

    # Filter out the unique links
    unique_links = get_unique_values(links, 'linkID')

    # Merge class level messages to package level messages
    for unique_link in unique_links:
        unique_link['count'] = int(links_list.count(unique_link['linkID']))  # set package level count
    #     for link in links:
    #         if link['linkID'] == unique_link['linkID']:
    #             unique_link['subLinks'].append(link['subLinks'])

    return unique_links


# filter unique nodes
def get_unique_values(values, v_id):
    unique_value_names = []
    unique_values = []
    for value in values:
        if value[v_id] not in unique_value_names:
            unique_value_names.append(value[v_id])
            unique_values.append(value)

    return unique_values



