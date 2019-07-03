import pymongo
from datetime import datetime, date
import pandas as pd

# client = pymongo.MongoClient('mongodb://localhost:27017/')
# db = client["archvis"]
# nodes_db = db['nodes']
# static_links_db = db['static_links']
# dynamic_links_db = db['dynamic_links']
list_node_names = []
list_nodes = []


def get_nodes(dataset, fr, to, file_name, data_type):
    # merge dependency from and to columns to one list
    nodes = dataset[fr].tolist() + dataset[to].tolist()
    unique_nodes = list(dict.fromkeys(nodes))

    # create a list of all nodes
    # for node_name in unique_nodes:
    #     # if node_name.startswith("xLibraries"):
    #     #     node_name = '/'.join(node_name.split('.')[1:])
    #     node_name = node_name + ".class"
    #     # get_all_nodes(node_name)

    # unique_node_names = list(dict.fromkeys(list_node_names))
    # print(unique_node_names)

    # create a separate dictionary for all unique nodes
    for node in unique_nodes:
        # if '/'.join(node.split('.')[:-1]):
        node_dict = {'name': '/'.join(node.split('.')),  # fullname
                     'origin': file_name,
                     'parent': '/'.join(node.split('.')[:-1]),
                     'dataType': data_type,
                     'count': sum([True for n in nodes if n.startswith(node)])}

        # append the dictionary to the list of node dictionaries
        list_nodes.append(node_dict)

    # insert in mongodb
    # nodes_db.insert_many(list_nodes)
    return list_nodes


def get_all_nodes(node_name):
    node_parent = '/'.join(node_name.split('.')[:-1])
    if node_name not in list_node_names:
        list_node_names.append(node_name)
        if node_parent:
            get_all_nodes(node_parent)


def get_links(dataset, fr, to, file_name, data_type, msg):
    dict_links = {}
    unique_links = []

    # create link ID column and lists to count from
    dataset['linkID'] = dataset[fr] + dataset[to]
    list_ids = dataset['linkID'].tolist()
    list_msgs = dataset[msg].tolist()

    # create a separate dictionary for all unique links
    for index, link in dataset.iterrows():
        if link[fr] and link[to]:
            link_id = link['linkID']
            message = link[msg]
            if message != "Empty.field":
                message_count = list_msgs.count(message)
            else:
                message_count = 1

            if data_type == 'Static':
                link_specs = get_static_specs(link, message_count)
            else:  # dynamic
                link_specs = get_dynamic_specs(link, message_count, dataset, msg)

            # if this is the first time we encounter this specific link ID
            if link_id not in unique_links:
                unique_links.append(link_id)
                sub_links = [link_specs]
                link_dict = {'source': '/'.join(link[fr].split('.')),
                             'target': '/'.join(link[to].split('.')),
                             'linkID': '/'.join(link_id.split('.')),
                             'dataType': data_type,
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


def get_static_specs(link, message_count):
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

    return link_specs


def get_dynamic_specs(link, message_count, dataset, msg):
    # Calculate duration
    start = datetime.strptime(link['Start Time'], '%H:%M:%S,%f')
    end = datetime.strptime(link['End Time'], '%H:%M:%S,%f')
    duration = datetime.combine(date.min, end.time()) - datetime.combine(date.min, start.time())

    dataset['threadM'] = dataset['Thread'] + dataset['Message']
    link_thread_m = link['Thread'] + link['Message']
    list_thread_m = dataset['threadM'].tolist()

    link_specs = {'startDate': link['Start Date'],
                  'startTime': link['Start Time'],
                  'endDate': link['End Date'],
                  'endTime': link['End Time'],
                  'source': '/'.join(link['Caller'].split('.')),
                  'target': '/'.join(link['Callee'].split('.')),
                  'duration': duration.microseconds,  # get an integer
                  'thread': link['Thread'],
                  'callerID': link['Caller ID'],
                  'calleeID': link['Callee ID'],
                  'message': '/'.join(link['Message'].split('.')),
                  'count': message_count,
                  'thread_count': list_thread_m.count(str(link_thread_m))}

    return link_specs





