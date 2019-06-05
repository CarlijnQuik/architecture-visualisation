# example: org/architecturemining/program/example/band/BandMember
# class_name = '/'.join(node_name.split('.')[:-1]) org/architecturemining/program/example/band
# package_1 = '/'.join(node_name.split('.')[:-2]) org/architecturemining/program/example
# package_2 = '/'.join(node_name.split('.')[:-3]) org/architecturemining/program
# package_2 = '/'.join(node_name.split('.')[:-4]) org/architecturemining


# return a list of unique node names
def get_nodes(dataset, fr, to, data_type):
    list_nodes = []

    # merge dependency from and to columns to one list
    nodes = dataset[fr].tolist() + dataset[to].tolist()
    unique_nodes = list(dict.fromkeys(nodes))

    # for node in unique_nodes:
    #     package_name = '/'.join(node.split('.')[3])
    #     packages.append(package_name)
    #
    # unique_packages = list(dict.fromkeys(packages))

    # create a separate dictionary for all unique nodes
    for node in unique_nodes:
        node_dict = {'id': '/'.join(node.split('.')),
                     'count': int(nodes.count(node)),
                     'name': '/'.join(node.split('.')),  # name
                     'type': data_type,
                     'package': '/'.join(node.split('.')[:-1])}

        # append the dictionary to the list of node dictionaries
        list_nodes.append(node_dict)

    return list_nodes


# return a list of links
def get_static_links(dataset, data_type):
    list_links = []

    # merge dependency from and to columns to one list
    messages = dataset['Used Entity (variable or method)'].tolist()
    # unique_messages = list(dict.fromkeys(messages))

    # create a separate dictionary for all unique links
    for index, row in dataset.iterrows():
        link_dict = {'message': '/'.join(row['Used Entity (variable or method)'].split('.')),
                     'source': '/'.join(row['Dependency from'].split('.')),
                     'target': '/'.join(row['Dependency to'].split('.')),
                     'type': row['Dependency type'],
                     'subType': row['Sub type'],
                     'line': row['Line'],
                     'isDirect': row['Direct/Indirect'],
                     'isInheritance': row['Inheritance Related'],
                     'isInnerClass': row['Inner Class Related'],
                     'dataType': data_type,
                     'count': int(messages.count(row['Used Entity (variable or method)']))}

        # append the dictionary to the list of link dictionaries
        list_links.append(link_dict)

    return list_links


# return a list of links
def get_dynamic_links(dataset, data_type):
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
                     'source': '/'.join(row['Caller'].split('.')),
                     'target': '/'.join(row['Callee'].split('.')),
                     'message': '/'.join(row['Message'].split('.')),
                     'dataType': data_type,
                     'methodName': '/'.join(row['Message'].split('.')),  # method name if applicable
                     'count': int(messages.count(row['Message']))}

        # append the dictionary to the list of link dictionaries
        list_links.append(link_dict)

    return list_links
