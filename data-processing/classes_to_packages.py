import pymongo
from datetime import datetime, date
import pandas as pd


def get_package_nodes(nodes):
    # Rename name and parent to one abstraction level higher
    for node in nodes:
        node['name'] = node['parent']
        node['parent'] = '/'.join(node['parent'].split('.')[:-1])

    # Filter out the unique nodes
    unique_nodes = get_unique_values(nodes, 'name')

    return unique_nodes


def get_package_links(links):
    # Rename source and target to one abstraction level higher
    for link in links:
        link['source'] = '/'.join(link['source'].split('.')[:-1])
        link['target'] = '/'.join(link['target'].split('.')[:-1])

    # Filter out the unique links
    unique_links = get_unique_values(links, 'linkID')

    return unique_links


# filter unique nodes
def get_unique_values(values, id):
    unique_value_names = []
    unique_values = []
    for value in values:
        if value[id] not in unique_value_names:
            unique_value_names.append(value[id])
            unique_values.append(value)

    return unique_values



