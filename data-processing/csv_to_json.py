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
        # nodes_db.insert_one(node_dict)

        # append the dictionary to the list of node dictionaries
        list_nodes.append(node_dict)

    # insert in mongodb
    # nodes_db.insert_many(list_nodes)
    return list_nodes


def get_static_links(dataset, file_name):
    dict_links = {}
    unique_links = []

    # create link ID column and lists to count from
    dataset['linkID'] = dataset['Dependency from'] + dataset['Dependency to']
    list_ids = dataset['linkID'].tolist()
    list_msgs = dataset['Used Entity (variable or method)'].tolist()

    # create a separate dictionary for all unique links
    for index, link in dataset.iterrows():
        link_id = link['linkID']
        message = link['Used Entity (variable or method)']
        if message != "Empty.field":
            message_count = list_msgs.count(message)
        else:
            message_count = 0

        link_specs = {
            'message': '/'.join(link['Used Entity (variable or method)'].split('.')),
            'type': link['Dependency type'],
            'subtype': link['Sub type'],
            'line': link['Line'],
            'direct': link['Direct/Indirect'],
            'inheritance': link['Inheritance Related'],
            'innerclass': link['Inner Class Related'],
            'source': '/'.join(link['Dependency from'].split('.')),
            'target': '/'.join(link['Dependency to'].split('.')),
            'count': message_count}  # the number of times the message exists in the dataset

        # if this is the first time we encounter this specific link ID
        if link_id not in unique_links:
            unique_links.append(link_id)
            sub_links = [link_specs]
            link_dict = {'source': '/'.join(link['Dependency from'].split('.')),
                         'target': '/'.join(link['Dependency to'].split('.')),
                         'linkID': '/'.join(link_id.split('.')),
                         'dataType': "Static",
                         'origin': file_name,
                         'count': list_ids.count(link['linkID']),  # the number of times the link id exists
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
    list_ids = dataset['linkID'].tolist()
    list_msgs = dataset['Message'].tolist()

    # create a separate dictionary for all unique links
    for index, link in dataset.iterrows():
        # Calculate duration
        start = datetime.strptime(link['Start Time'], '%H:%M:%S,%f')
        end = datetime.strptime(link['End Time'], '%H:%M:%S,%f')
        duration = datetime.combine(date.min, end.time()) - datetime.combine(date.min, start.time())

        link_id = link['linkID']
        message = link['Message']
        if message != "Empty.field":
            message_count = list_msgs.count(message)
        else:
            message_count = 0

        link_specs = {'startDate': link['Start Date'],
                      'startTime': link['Start Time'],
                      'endDate': link['End Date'],
                      'endTime': link['End Time'],
                      'source': '/'.join(link['Caller'].split('.')),
                      'target': '/'.join(link['Callee'].split('.')),
                      'duration': duration.total_seconds(),  # get an integer
                      'thread': link['Thread'],
                      'callerID': link['Caller ID'],
                      'calleeID': link['Callee ID'],
                      'message': '/'.join(link['Message'].split('.')),
                      'count': message_count}

        if link_id not in unique_links:
            unique_links.append(link_id)
            sub_links = [link_specs]
            link_dict = {'source': '/'.join(link['Caller'].split('.')),
                         'target': '/'.join(link['Callee'].split('.')),
                         'linkID': '/'.join(link_id.split('.')),
                         'origin': file_name,
                         'dataType': "Dynamic",
                         'count': list_ids.count(link['linkID']),
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
