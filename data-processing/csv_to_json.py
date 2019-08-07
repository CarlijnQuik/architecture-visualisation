import datetime
import pandas as pd
import threading
import time
import numpy as np

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
    target_nodes = dataset[to].tolist()
    unique_nodes = list(dict.fromkeys(nodes))

    # create a separate dictionary for all unique nodes
    for node in unique_nodes:
        name = '.'.join(node.split('.'))
        # if '/'.join(node.split('.')[:-1]):
        node_dict = {'name': name,  # fullname
                     'origin': file_name,
                     'parent': '.'.join(node.split('.')[:-1]),
                     'dataType': data_type,
                     'root': '.'.join(node.split('.')[:1]),
                     'count': sum([True for n in target_nodes if n == name])}

        # append the dictionary to the list of node dictionaries
        list_nodes.append(node_dict)

    # insert in mongodb
    # nodes_db.insert_many(list_nodes)
    return list_nodes


def get_all_nodes(node_name):
    node_parent = '.'.join(node_name.split('.')[:-1])
    if node_name not in list_node_names:
        list_node_names.append(node_name)
        if node_parent:
            get_all_nodes(node_parent)


def get_links(dataset, dataset_part, fr, to, file_name, data_type, msg):
    dict_links = {}
    unique_links = []

    # create link ID column and lists to count from
    list_ids = dataset['linkID'].tolist()
    list_ids_reversed = dataset['reverseID'].tolist()
    list_msgs = dataset[msg].tolist()
    list_thread_m = dataset['threadM'].tolist()

    counter = 0
    # create a separate dictionary for all unique links
    for index, link in dataset_part.iterrows():
        counter = counter+1
        print("counter: ", counter, len(dataset_part))
        if link[fr] and link[to]:
            link_id = link['linkID']
            reverse_id = link['reverseID']
            message = link[msg]
            if message != "Empty.field":
                message_count = list_msgs.count(message)
            else:
                message_count = 1

            if data_type == 'Static':
                link_specs = get_static_specs(link, message_count)
            else:  # dynamic
                link_specs = get_dynamic_specs(link, message_count, list_thread_m, dataset)

            sub_links = [link_specs]
            link_dict = {'source': '.'.join(link[fr].split('.')),
                         'target': '.'.join(link[to].split('.')),
                         'linkID': '.'.join(link_id.split('.')),
                         'dataType': data_type,
                         'origin': file_name,
                         'countLinkID': list_ids.count(link['linkID']),  # the number of times the link id exists
                         'reverseCount': list_ids_reversed.count(link['reverseID']),
                         'count': list_ids.count(link['linkID']) + list_ids_reversed.count(link['reverseID']),
                         'subLinks': sub_links}

            # if this is the first time we encounter this specific link ID and reverse ID
            if link_id not in unique_links and reverse_id not in unique_links:
                unique_links.append(link_id)
                dict_links[link_id] = link_dict

            # if the link ID has been added to list_links already
            elif link_id in unique_links and reverse_id not in unique_links:
                dict_links[link_id]["subLinks"].append(link_specs)

            # if the reverse ID has been added to list_links already
            elif reverse_id in unique_links and link_id not in unique_links:
                # unique_links.append(reverse_id)
                dict_links[reverse_id]["subLinks"].append(link_specs)
                # dict_links[reverse_id] = link_dict

            elif reverse_id in unique_links and link_id in unique_links:
                print("DOUBLE", reverse_id, link_id)

    # insert in mongodb
    # static_links_db.insert_many(list_links)
    list_links = list(dict_links.values())
    return list_links


def get_static_specs(link, message_count):
    link_specs = {
        'message': '.'.join(link['Used Entity (variable or method)'].split('.')),
        'type': link['Dependency type'],
        'subtype': link['Sub type'],
        'line': link['Line'],
        'direct': link['Direct/Indirect'],
        'inheritance': link['Inheritance Related'],
        'innerclass': link['Inner Class Related'],
        'source': '.'.join(link['Dependency from'].split('.')),
        'target': '.'.join(link['Dependency to'].split('.')),
        'linkID': '.'.join(link['linkID'].split('.')),
        'count': message_count}  # the number of times the message exists in the dataset

    return link_specs


def get_dynamic_specs(link, message_count, list_thread_m, dataset):
    link_thread_m = link['Thread'] + link['Message']

    durations = dataset.loc[link['msgID'] == dataset['msgID']]['duration_seconds'].values.tolist()
    #sub_calls = dataset.loc[(dataset['Callee'] == link['Caller']) & (dataset['End Time'] <= link['End Time']) & (dataset['Start Time'] >= link['Start Time']) & (dataset['Message'] != link['Message'])]['Message'].values.tolist()

    link_specs = {'startDate': link['Start Date'],
                  'startTime': str(link['Start Time']).split(" ")[-1],
                  'endDate': link['End Date'],
                  'endTime': str(link['End Time']).split(" ")[-1],
                  'source': '.'.join(link['Caller'].split('.')),
                  'target': '.'.join(link['Callee'].split('.')),
                  'duration': link['duration_seconds'],  # get an integer
                  'thread': link['Thread'],
                  'callerID': link['Caller ID'],
                  'calleeID': link['Callee ID'],
                  'linkID': '.'.join(link['linkID'].split('.')),
                  'message': '.'.join(link['Message'].split('.')),
                  'msgID': link['msgID'],
                  # 'sub_calls': sub_calls,
                  'duration_sum': sum(durations),
                  'avg_duration': sum(durations)/message_count,
                  'count': message_count,
                  'msg_on_thread_count': list_thread_m.count(link_thread_m)}

    return link_specs








