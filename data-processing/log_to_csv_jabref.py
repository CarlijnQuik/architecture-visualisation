import csv
import re
from docutils.writers import null


def fix_null_callee(callee_class, call):
    # example callee_class: null.CallerPsuedoId: 1987196923
    # example call: public abstract java.util.Optional java.util.stream.Stream.findFirst()
    first_part = callee_class.split('.')[0]
    if first_part == 'null':
        pattern = '([a-zA-Z_$][a-zA-Z\d_$]*\.)+'
        call = call.split('(')[-2]
        call = call.split(' ')[-1]
        call_stripped = re.search(pattern, call)
        call_stripped = call_stripped.group(0).split('.')[:-1]
        fixed = ".".join(call_stripped)
        return fixed
    else:
        return callee_class


# open input file, get needed data, format and write to output file
def get_csv(input_file, output_file):
    with open(input_file, 'r') as f:
        reader = csv.DictReader(f, delimiter=';',
                                fieldnames=['Timestamp', 'Thread', 'Type', 'Caller',
                                            'Callee', 'Message'])

        with open(output_file, 'w', newline='') as out:
            writer = csv.writer(out, delimiter=';')

            # write header row
            writer.writerow(['Start Date', 'Start Time', 'End Date', 'End Time', 'Thread', 'Caller ID', 'Caller',
                             'Callee ID', 'Callee', 'Message'])

            stacks = {}
            for row in reader:
                if row['Type'] == 'Entry':
                    if row['Thread'] in stacks:
                        stacks[row['Thread']].append(row)
                    else:
                        stacks[row['Thread']] = [row]
                elif row['Type'] == 'Exit':
                    callee = fix_null_callee(row['Callee'], row['Message'])
                    entry = stacks[row['Thread']].pop()
                    writer.writerow([entry['Timestamp'].split('T')[0], entry['Timestamp'].split('T')[1],
                                     row['Timestamp'].split('T')[0], row['Timestamp'].split('T')[1],
                                     row['Thread'],
                                     ''.join(row['Caller'].split('.')[-1]),  # callerID
                                     '.'.join(row['Caller'].split('.')[:-1]),  # caller
                                     ''.join(callee.split('.')[-1]),  # calleeID
                                     '.'.join(callee.split('.')[:-1]),  # callee
                                     row['Message']])
                # else:
                # print(row)

            for thread_name, thread in stacks.items():
                if len(thread) > 0:
                    print('Incomplete log for thread {}, flushing'.format(thread_name))
                    while len(thread) > 0:
                        row = thread.pop()
                        print(row)
                        writer.writerow([row['Timestamp'].split('T')[0], row['Timestamp'].split('T')[1],
                                         row['Timestamp'].split('T')[0], row['Timestamp'].split('T')[1],
                                        row['Thread'],
                                        ''.join(row['Caller'].split('.')[-1]),  # callerID
                                        '.'.join(row['Caller'].split('.')[:-1]),  # caller
                                         ''.join(row['Callee'].split('.')[-1]),  # calleeID
                                         '.'.join(callee.split('.')[:-1]),  # callee
                                        row['Message']])

        return output_file
