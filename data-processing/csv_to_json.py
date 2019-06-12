import pymongo

# client = pymongo.MongoClient('mongodb://localhost:27017/')
# db = client["archvis"]
# nodes_db = db['nodes']
# static_links_db = db['static_links']
# dynamic_links_db = db['dynamic_links']


# return a list of unique node names
def get_nodes(dataset, fr, to, file_name, data_type):
    list_nodes = []

    # merge dependency from and to columns to one list
    nodes = dataset[fr].tolist() + dataset[to].tolist()
    unique_nodes = list(dict.fromkeys(nodes))

    # create a separate dictionary for all unique nodes
    for node in unique_nodes:
        node_dict = {'name': node,  # fullname
                     'origin': file_name,
                     'dataType': data_type,
                     'origin': file_name}

        # # if the node is not already present in the db
        # if not nodes_db.find_one({"name": '/'.join(node.split('.'))}):
        # # insert in mongodb
        # nodes_db.insert_one(node_dict)

        # append the dictionary to the list of node dictionaries
        list_nodes.append(node_dict)

    # insert in mongodb
    # nodes_db.insert_many(list_nodes)
    return list_nodes


# return a list of links
def get_static_links(dataset, file_name):
    list_links = []

    # merge dependency from and to columns to one list
    messages = dataset['Used Entity (variable or method)'].tolist()
    # unique_messages = list(dict.fromkeys(messages))

    # create a separate dictionary for all unique links
    for index, row in dataset.iterrows():
        link_dict = {'message': row['Used Entity (variable or method)'],
                     'source': row['Dependency from'],
                     'target': row['Dependency to'],
                     'type': row['Dependency type'],
                     'subtype': row['Sub type'],
                     'line': row['Line'],
                     'direct': row['Direct/Indirect'],
                     'inheritance': row['Inheritance Related'],
                     'innerclass': row['Inner Class Related'],
                     'origin': file_name,
                     'count': "DUMMY",
                     'dataType': "Static"}

        # append the dictionary to the list of link dictionaries
        list_links.append(link_dict)

    # insert in mongodb
    # static_links_db.insert_many(list_links)
    return list_links


# return a list of links
def get_dynamic_links(dataset, file_name):
    list_links = []

    # merge dependency from and to columns to one list
    messages = dataset['Message'].tolist()
    # unique_messages = list(dict.fromkeys(messages))

    # create a separate dictionary for all unique links
    for index, row in dataset.iterrows():
        link_dict = {'startDate': row['Start Date'],
                     'startTime': row['Start Time'],
                     'endDate': row['End Date'],
                     'endTime': row['End Time'],
                     'thread': row['Thread'],
                     'callerID': row['Caller ID'],
                     'calleeID': row['Callee ID'],
                     'source': row['Caller'],
                     'target': row['Callee'],
                     'message': row['Message'],
                     'origin': file_name,
                     'dataType': "Dynamic"}

        # append the dictionary to the list of link dictionaries
        list_links.append(link_dict)

    # insert in mongodb
    # dynamic_links_db.insert_many(list_links)
    return list_links
