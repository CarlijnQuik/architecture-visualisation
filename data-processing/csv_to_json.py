import pymongo
from datetime import datetime, date
import pandas as pd

# client = pymongo.MongoClient('mongodb://localhost:27017/')
# db = client["archvis"]
# nodes_db = db['nodes']
# static_links_db = db['static_links']
# dynamic_links_db = db['dynamic_links']


def get_nodes(dataset, fr, to, file_name, data_type):
    list_nodes = []

    # merge dependency from and to columns to one list
    nodes = dataset[fr].tolist() + dataset[to].tolist()
    unique_nodes = list(dict.fromkeys(nodes))

    # create a separate dictionary for all unique nodes
    for node in unique_nodes:
        # print(node, parent)
        node_dict = {'name': '/'.join(node.split('.')),  # fullname
                     'origin': file_name,
                     'parent': '/'.join(node.split('.')[:-1]),
                     'dataType': data_type,
                     'count': int(nodes.count(node))}

        # if the node is not already present in the db
        # if not nodes_db.find_one({"name": '/'.join(node.split('.'))}):
        # # insert in mongodb
        # nodes_db.insert_one(node_dict)htt

        # append the dictionary to the list of node dictionaries
        list_nodes.append(node_dict)

    # insert in mongodb
    # nodes_db.insert_many(list_nodes)
    return list_nodes


def get_static_links(dataset, file_name):
    dict_links = {}
    unique_links = []

    # merge dependency from and to columns to one list
    dataset['linkID'] = dataset['Dependency from'] + dataset['Dependency to']
    df = pd.DataFrame(dataset)  # create dataframe

    # merge dependency message column to one list
    messages = dataset['Used Entity (variable or method)'].tolist()
    messages = [x for x in messages if x != "Empty.field"]

    # create a separate dictionary for all unique links
    for index, row in dataset.iterrows():
        link_id = row['Dependency from'] + row['Dependency to']

        link_specs = {
            'message': '/'.join(row['Used Entity (variable or method)'].split('.')),
            'type': row['Dependency type'],
            'subtype': row['Sub type'],
            'line': row['Line'],
            'direct': row['Direct/Indirect'],
            'inheritance': row['Inheritance Related'],
            'innerclass': row['Inner Class Related'],
            'messageCount': int(messages.count(
                row['Used Entity (variable or method)']))}  # the number of times the message exists in the dataset

        # if this is the first time we encounter this specific link ID
        if link_id not in unique_links:
            unique_links.append(link_id)
            sub_links = [link_specs]
            link_dict = {'source': '/'.join(row['Dependency from'].split('.')),
                         'target': '/'.join(row['Dependency to'].split('.')),
                         'linkID': '/'.join(link_id.split('.')),
                         'dataType': "Static",
                         'origin': file_name,
                         'count': len(df[df.linkID == link_id]),
                         # the number of times the link id exists in the dataset
                         'subLinks': sub_links}

            dict_links[link_id] = link_dict

        # if the link ID has been added to list_links already
        else:
            dict_links[link_id]["subLinks"].append(link_specs)

    # insert in mongodb
    # static_links_db.insert_many(list_links)
    list_links = list(dict_links.values())
    return list_links


def get_dynamic_links(dataset, file_name):
    dict_links = {}
    unique_links = []

    # merge dependency from and to columns to one list
    dataset['linkID'] = dataset['Caller'] + dataset['Callee']
    df = pd.DataFrame(dataset)  # create dataframe

    # merge dependency from and to columns to one list
    messages = dataset['Message'].tolist()
    messages = [x for x in messages if x != "Empty.field"]

    # create a separate dictionary for all unique links
    for index, row in dataset.iterrows():
        link_id = row['Caller'] + row['Callee']
        start = datetime.strptime(row['Start Time'], '%H:%M:%S,%f')
        end = datetime.strptime(row['End Time'], '%H:%M:%S,%f')
        duration = datetime.combine(date.min, end.time()) - datetime.combine(date.min, start.time())

        link_specs = {'startDate': row['Start Date'],
                      'startTime': row['Start Time'],
                      'endDate': row['End Date'],
                      'endTime': row['End Time'],
                      'duration': duration.total_seconds(),  # get an integer
                      'thread': row['Thread'],
                      'callerID': row['Caller ID'],
                      'calleeID': row['Callee ID'],
                      'message': '/'.join(row['Message'].split('.')),
                      'messageCount': int(messages.count(row['Message']))}

        if link_id not in unique_links:
            unique_links.append(link_id)
            sub_links = [link_specs]
            link_dict = {'source': '/'.join(row['Caller'].split('.')),
                         'target': '/'.join(row['Callee'].split('.')),
                         'linkID': '/'.join(link_id.split('.')),
                         'origin': file_name,
                         'dataType': "Dynamic",
                         'count': len(df[df.linkID == link_id]),
                         'subLinks': sub_links}

            # append the dictionary to the list of link dictionaries
            dict_links[link_id] = link_dict

        # if the link ID has been added to list_links already
        else:
            dict_links[link_id]["subLinks"].append(link_specs)

    # insert in mongodb
    # dynamic_links_db.insert_many(list_links)
    list_links = list(dict_links.values())
    return list_links
